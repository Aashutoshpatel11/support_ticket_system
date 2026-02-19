from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q, Min
from django.utils.timezone import now

from .models import Ticket
from .serializers import TicketSerializer

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['category', 'priority', 'status']
    search_fields = ['title', 'description']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Return aggregated statistics using DB-level aggregation.
        Avoids Python loops entirely as required.
        """
        aggs = Ticket.objects.aggregate(
            total_tickets=Count('id'),
            open_tickets=Count('id', filter=Q(status='open')),
            
            p_low=Count('id', filter=Q(priority='low')),
            p_medium=Count('id', filter=Q(priority='medium')),
            p_high=Count('id', filter=Q(priority='high')),
            p_critical=Count('id', filter=Q(priority='critical')),
            
            c_billing=Count('id', filter=Q(category='billing')),
            c_technical=Count('id', filter=Q(category='technical')),
            c_account=Count('id', filter=Q(category='account')),
            c_general=Count('id', filter=Q(category='general')),
            
            first_ticket_date=Min('created_at')
        )

        total = aggs['total_tickets']
        avg_per_day = 0
        if total > 0 and aggs['first_ticket_date']:
            days_active = (now() - aggs['first_ticket_date']).days or 1
            avg_per_day = round(total / days_active, 1)

        response_data = {
            "total_tickets": total,
            "open_tickets": aggs['open_tickets'],
            "avg_tickets_per_day": avg_per_day,
            "priority_breakdown": {
                "low": aggs['p_low'],
                "medium": aggs['p_medium'],
                "high": aggs['p_high'],
                "critical": aggs['p_critical']
            },
            "category_breakdown": {
                "billing": aggs['c_billing'],
                "technical": aggs['c_technical'],
                "account": aggs['c_account'],
                "general": aggs['c_general']
            }
        }
        return Response(response_data)

    