from django.core.management.base import BaseCommand

from battle.models import BattleRoom

class Command(BaseCommand):
    help = 'Refresh MongoDB by removing all documents from the rooms collection'

    def handle(self, *args, **kwargs):
        try:
            BattleRoom.objects.delete()
            self.stdout.write(self.style.SUCCESS('Successfully removed all documents from the rooms collection'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error occurred: {e}'))
