from django.apps import AppConfig


class MorisummonConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'morisummon'

    def ready(self):
        import morisummon.signals
