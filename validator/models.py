from django.db import models
from django.contrib.auth.models import User

class StartupIdea(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ideas')
    idea_text = models.TextField()
    report_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __cl__(self):
        return f"{self.user.username} - {self.idea_text[:30]}..."
