from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer, AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from asgiref.sync import sync_to_async
import json
from morisummon.models import CustomUser, ChatGroup, ChatMessage, CardExchange, Card, ExchangeSession


class ChatConsumer(AsyncWebsocketConsumer):
    user: CustomUser | AnonymousUser = None
    group_name = None

    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            await self.close()
            return

        self.group_name = self.scope['url_route']['kwargs']['group_name']

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        # 履歴取得後にクライアントに送信する場所
        messages = await sync_to_async(list)(
            ChatMessage.objects.filter(group__name=self.group_name).order_by('timestamp')
        )
        for message in messages:
            sender = await sync_to_async(lambda: message.sender)()
            await self.send(text_data=json.dumps({
                'message': message.message,
                'sender': {
                    'id': sender.id,
                    'name': sender.username,
                },
                'timestamp': message.timestamp.isoformat()
            }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data=None):
        if text_data:
            data = json.loads(text_data)
            message = data.get('message')

            chat_group, created = await sync_to_async(ChatGroup.objects.get_or_create)(name=self.group_name)

            chat_message = await sync_to_async(ChatMessage.objects.create)(
                group=chat_group,
                sender=self.user,
                message=message
            )

            # データ形式はフロント側と形式を合わせた
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender': {
                        'id': self.user.id,
                        'name': self.user.username,
                    },
                    'timestamp': chat_message.timestamp.isoformat()
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
            'timestamp': event['timestamp']
        }))



class ExchangeConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.exchange_id = self.scope['url_route']['kwargs']['exchange_id']
        self.user = await self.get_user()

        exchange = await self.get_exchange()
        # Ensure user is either initiator or receiver
        if self.user != exchange.initiator and self.user != exchange.receiver:
            await self.close()
            return

        await self.accept()
        await self.channel_layer.group_add(f"exchange_{self.exchange_id}", self.channel_name)

        ready, exchange = await self.mark_ready()
        if ready and exchange.status == 'waiting':
            exchange.status = 'selecting'
            await self.save_exchange(exchange)
        await self.notify_participants(exchange)

    @database_sync_to_async
    def get_user(self):
        return self.scope["user"]

    @database_sync_to_async
    def get_exchange(self):
        return CardExchange.objects.select_related('initiator', 'receiver').get(id=self.exchange_id)

    @database_sync_to_async
    def mark_ready(self):
        exchange = CardExchange.objects.get(id=self.exchange_id)
        session, created = ExchangeSession.objects.get_or_create(exchange=exchange)

        if self.user == exchange.initiator:
            session.initiator_ready = True
        elif self.user == exchange.receiver:
            session.receiver_ready = True
        session.save()
        return (session.initiator_ready and session.receiver_ready), exchange


    @database_sync_to_async
    def save_exchange(self, exchange):
        exchange.save()

    async def notify_participants(self, exchange):
        await self.channel_layer.group_send(
            f"exchange_{self.exchange_id}",
            {
                'type': 'exchange.update',
                'data': {
                    'initiator_card': exchange.initiator_card.id if exchange.initiator_card else None,
                    'receiver_card': exchange.receiver_card.id if exchange.receiver_card else None,
                    'status': exchange.status,
                }
            }
        )

    async def exchange_update(self, event):
        # クライアントに JSON 形式で送信
        await self.send_json(event['data'])

    async def receive_json(self, content):
        action = content.get('action')
        if action == 'select_card':
            card_id = content.get('card_id')
            exchange = await self.handle_card_selection(card_id)
            await self.notify_participants(exchange)
        elif action == 'confirm':
            exchange = await self.handle_confirmation()
            await self.notify_participants(exchange)
        elif action == 'cancel':
            exchange = await self.handle_cancellation()
            await self.notify_participants(exchange)

    @database_sync_to_async
    def handle_card_selection(self, card_id):
        exchange = CardExchange.objects.get(id=self.exchange_id)
        card = Card.objects.get(id=card_id)
        if self.user == exchange.initiator:
            exchange.initiator_card = card
        elif self.user == exchange.receiver:
            exchange.receiver_card = card
        exchange.save()
        return exchange

    @database_sync_to_async
    def handle_confirmation(self):
        exchange = CardExchange.objects.get(id=self.exchange_id)
        if exchange.initiator_card and exchange.receiver_card:
            exchange.status = 'completed'
            exchange.save()
        return exchange

    @database_sync_to_async
    def handle_cancellation(self):
        exchange = CardExchange.objects.get(id=self.exchange_id)
        exchange.status = 'canceled'
        exchange.save()
        return exchange
