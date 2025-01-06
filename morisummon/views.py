from django.conf import settings
from django.shortcuts import render

def index(request):
    if settings.VITE_DEV:
        return render(request, 'dev.html')
    else:
        return render(request, 'index.html')
