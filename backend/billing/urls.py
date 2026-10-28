from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StudentViewSet, BatchViewSet, AcademicProgramViewSet,
    CenterViewSet, ReferencePersonViewSet, PaymentTransactionViewSet,
    CustomFieldDefinitionViewSet, WhatsAppTemplateViewSet,
    UserRoleProfileViewSet, CustomFeeLineItemViewSet, AcademicYearFeeViewSet,
    KPIView, InitialIngestView, ExcelExportView, InstitutionSettingsView,
    TestSMTPEmailView, ForgotPasswordView, ResetPasswordView
)

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')
router.register(r'batches', BatchViewSet, basename='batch')
router.register(r'programs', AcademicProgramViewSet, basename='program')
router.register(r'centers', CenterViewSet, basename='center')
router.register(r'references', ReferencePersonViewSet, basename='reference')
router.register(r'payments', PaymentTransactionViewSet, basename='payment')
router.register(r'line-items', CustomFeeLineItemViewSet, basename='line-item')
router.register(r'year-fees', AcademicYearFeeViewSet, basename='year-fee')
router.register(r'custom-fields', CustomFieldDefinitionViewSet, basename='custom-field')
router.register(r'whatsapp-templates', WhatsAppTemplateViewSet, basename='whatsapp-template')
router.register(r'roles', UserRoleProfileViewSet, basename='role-profile')

urlpatterns = [
    path('kpis/', KPIView.as_view(), name='kpis'),
    path('kpi/', KPIView.as_view(), name='kpi'),
    path('ingest-resources/', InitialIngestView.as_view(), name='ingest-resources'),
    path('export-excel/', ExcelExportView.as_view(), name='export-excel'),
    path('settings/institution/', InstitutionSettingsView.as_view(), name='institution-settings'),
    path('settings/test-smtp/', TestSMTPEmailView.as_view(), name='test-smtp'),
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('', include(router.urls)),
]

