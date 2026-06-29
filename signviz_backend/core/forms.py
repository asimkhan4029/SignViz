from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import DeafUser

class DeafUserCreationForm(UserCreationForm):
    class Meta:
        model = DeafUser
        fields = ('username', 'email', 'name', 'profile_info')
        
    # Mapping 'name' field to first_name/last_name or just keeping it custom
    name = forms.CharField(max_length=255, required=False)

    def save(self, commit=True):
        user = super().save(commit=False)
        user.first_name = self.cleaned_data["name"]
        if commit:
            user.save()
        return user

class DeafUserChangeForm(UserChangeForm):
    class Meta:
        model = DeafUser
        fields = ('username', 'email', 'profile_info')
