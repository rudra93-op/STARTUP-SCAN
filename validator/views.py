import json
from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import StartupIdea
from .services.ai_service import analyze_idea
from .services.news_service import get_news_context, get_trends


def index(request):
    return render(request, 'validator/index.html')


def login_view(request):
    if request.user.is_authenticated:
        return redirect('index')

    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            login(request, form.get_user())
            return redirect('index')
    else:
        form = AuthenticationForm()

    return render(request, 'validator/login.html', {'form': form})


def signup_view(request):
    if request.user.is_authenticated:
        return redirect('index')

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Account created successfully. Please log in.')
            return redirect('login')
    else:
        form = UserCreationForm()

    return render(request, 'validator/signup.html', {'form': form})


@login_required(login_url='login')
def logout_view(request):
    logout(request)
    return redirect('login')


@csrf_exempt
@require_http_methods(["POST"])
def validate(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Login required to save and view your report.'}, status=401)

    try:
        body = json.loads(request.body)
        idea = body.get('idea', '').strip()

        if not idea or len(idea) < 15:
            return JsonResponse(
                {'error': 'Idea thoda detail mein likho (minimum 15 characters)'},
                status=400
            )

        news_context = get_news_context(idea)
        trends = get_trends(idea)
        if trends:
            news_context += "\n\nGoogle Trends:\n" + "\n".join(trends)

        result = analyze_idea(idea, news_context)
        result['idea'] = idea
        result['news_fetched'] = bool(news_context)

        idea_obj = StartupIdea.objects.create(
            user=request.user,
            idea_text=idea,
            report_data=result
        )

        result['idea_id'] = idea_obj.id
        return JsonResponse({'success': True, 'data': result})

    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=422)
    except Exception as e:
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)


@login_required(login_url='login')
def dashboard(request):
    ideas = request.user.ideas.order_by('-created_at')
    return render(request, 'validator/dashboard.html', {'ideas': ideas})


@login_required(login_url='login')
def view_idea(request, idea_id):
    idea = get_object_or_404(StartupIdea, id=idea_id, user=request.user)
    return redirect(f"{reverse('report')}?id={idea.id}")


@login_required(login_url='login')
def get_idea(request, idea_id):
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    idea = get_object_or_404(StartupIdea, id=idea_id, user=request.user)
    return JsonResponse({'success': True, 'data': idea.report_data})


@login_required(login_url='login')
def report(request):
    return render(request, 'validator/report.html')