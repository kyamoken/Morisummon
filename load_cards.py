import json
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from morisummon.models import Card

def load_cards():
    with open('cards_data.json', 'r', encoding='utf-8') as file:
        cards_data = json.load(file)
        for card_data in cards_data:
            Card.objects.create(
                name=card_data['name'],
                hp=card_data['hp'],
                attack=card_data['attack'],
                image=card_data['image']
            )
    print("カードデータの登録が完了しました。")

if __name__ == '__main__':
    load_cards()
