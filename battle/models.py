import datetime
from django.db import models
from mongoengine import *

# Create your models here.

class BattleCardInfo(EmbeddedDocument):
    id = StringField(primary_key=True)
    name = StringField()
    image = StringField(null=True)
    # description = StringField()

    energy = IntField(default=0)
    attack_needs_energy = IntField(default=0)
    escape_needs_energy = IntField(default=0)

    hp = IntField()
    attack = IntField()
    # defense = IntField()

class BattlePlayerInfo(EmbeddedDocument):
    id = StringField(primary_key=True)
    name = StringField()
    level = IntField(default=1)
    avatar = StringField(null=True)
    is_connected = BooleanField(default=True)
    is_owner = BooleanField(default=False)
    channel_name = StringField()

class BattlePlayerStatus(EmbeddedDocument):
    """バトル中のプレイヤーの公開情報"""
    # バトルカード
    battle_card = EmbeddedDocumentField(BattleCardInfo)

    # ベンチ
    bench_cards = ListField(EmbeddedDocumentField(BattleCardInfo), default=[])
    bench_cards_max = IntField(default=5)

    # 手札
    _hand_cards = ListField(EmbeddedDocumentField(BattleCardInfo), default=[])
    hand_cards_count = IntField(default=0)

    # 山札
    _deck_cards = ListField(EmbeddedDocumentField(BattleCardInfo), default=[])

    life = IntField(default=2)

class PlayerSet(EmbeddedDocument):
    info = EmbeddedDocumentField(BattlePlayerInfo)
    status = EmbeddedDocumentField(BattlePlayerStatus)

class BattleRoom(Document):

    id = StringField(primary_key=True)
    keyphrase = StringField(null=True)
    # name = StringField()
    status = StringField(default="waiting")
    password = StringField(null=True)

    player1 = EmbeddedDocumentField(PlayerSet)
    player2 = EmbeddedDocumentField(PlayerSet, null=True)

    turn = IntField(default=1)
    winner = StringField(null=True)

    created_at = DateTimeField(default=datetime.datetime.now)

    meta = {
        'collection': 'battle_rooms'
    }

    def __str__(self):
        return f"{self.player1.name} vs {self.player2.name}"
