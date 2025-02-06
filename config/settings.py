import environ
import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# environ
env = environ.Env(
    # set casting, default value
    DEBUG=(bool, True),
    VITE_DEV=(bool, False),
    VITE_DEV_PORT=(int, 5173),

)
env.read_env(os.path.join(BASE_DIR, '.env'))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-t7cj!95!!@4=(rit00rq(q(0i9=^kk^g9c1^#!l05^32l7#roi'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG')
VITE_DEV = env('VITE_DEV')

ALLOWED_HOSTS = []

CSRF_TRUSTED_ORIGINS = []

if VITE_DEV:
    CSRF_TRUSTED_ORIGINS.append('http://localhost:' + str(env('VITE_DEV_PORT')))

# Application definition

INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'django_vite',
    'rest_framework.authtoken',

    'morisummon',
    'accounts',
    'battle',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
        # 'rest_framework.authentication.TokenAuthentication',
    ]
}

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates']
        ,
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'



# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'ja'

TIME_ZONE = 'Asia/Tokyo'


USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / 'static'
]
# STATIC_ROOT = BASE_DIR / 'staticfiles'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

DJANGO_VITE = {
    'default': {
        'manifest_path': BASE_DIR / 'static/build/manifest.json',
        'static_url_prefix': 'build',
        'dev_mode': VITE_DEV,
    }
}

ASGI_APPLICATION = 'config.asgi.application'

channel_layer_defaults = {
    'memory': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer'
    },
    'redis': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [{
                'address': env.str('CHANNEL_LAYER_REDIS_URL', 'redis://127.0.0.1:6379'),
            }],
        },
    },
}

CHANNEL_LAYERS = {
    'default': channel_layer_defaults[env.str('CHANNEL_LAYER', 'memory')],
}

MORISUMMON_DECK_SIZE = 5 # デッキのサイズ

AUTH_USER_MODEL = 'accounts.User'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        # 'file': {
        #     'level': 'DEBUG',
        #     'class': 'logging.FileHandler',
        #     'filename': os.path.join(BASE_DIR, 'logs', 'django.log'),
        #     'formatter': 'verbose',
        # },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
        'battle': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# MongoEngine
import mongoengine

MONGO_HOST = 'mongodb://' + env.str('MONGO_HOST', 'localhost') + ':' + env.str('MONGO_PORT', '27017')
MONGO_DATABASE = env.str('MONGO_DATABASE', 'morisummon')
MONGO_USERNAME = env.str('MONGO_USERNAME', '')
MONGO_PASSWORD = env.str('MONGO_PASSWORD', '')

mongoengine.connect(
    db=MONGO_DATABASE,
    host=MONGO_HOST,
    username=MONGO_USERNAME,
    password=MONGO_PASSWORD,
)
