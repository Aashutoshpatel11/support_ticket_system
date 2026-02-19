from django.db import models

# Create your models here.
class Ticket(models.Model):
    Category_choices= [
        ('billing', 'Billing'),
        ('technical', 'Technical'),
        ('account', 'Account'),
        ('general', 'General'),
    ]
    priority_choices= [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    status_choices= [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ] 

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(
        max_length=20,
        choices=Category_choices.choices,
    )
    priority = models.CharField(
        max_length=20,
        choices=priority_choices.choices,
    )
    status = models.CharField(
        max_length=20,
        choices=status_choices.choices,
        default='open',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.status}"