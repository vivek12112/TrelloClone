from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Board, List, Card
from .serializers import BoardSerializer, ListSerializer, CardSerializer


class BoardViewSet(viewsets.ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer


class ListViewSet(viewsets.ModelViewSet):
    queryset = List.objects.select_related("board").all()
    serializer_class = ListSerializer

    @action(detail=True, methods=["post"])
    def move(self, request, pk=None):
        """Update a list position (for drag-and-drop)."""
        list_obj = self.get_object()
        position = request.data.get("position")
        if position is None:
            return Response(
                {"detail": "position is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        list_obj.position = float(position)
        list_obj.save(update_fields=["position"])
        return Response(ListSerializer(list_obj).data)


class CardViewSet(viewsets.ModelViewSet):
    queryset = Card.objects.select_related("list", "list__board").all()
    serializer_class = CardSerializer

    @action(detail=True, methods=["post"])
    def move(self, request, pk=None):
        """
        Move or reorder a card.
        Payload:
        {
          "list": <list_id>,     # optional (target list)
          "position": <float>    # required
        }
        """
        card = self.get_object()
        position = request.data.get("position")
        if position is None:
            return Response(
                {"detail": "position is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_list_id = request.data.get("list")
        if target_list_id is not None:
            try:
                target_list = List.objects.get(id=target_list_id)
            except List.DoesNotExist:
                return Response(
                    {"detail": "Target list not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            card.list = target_list

        card.position = float(position)
        card.save(update_fields=["list", "position"])
        return Response(CardSerializer(card).data)

from rest_framework.decorators import api_view
from django.db.models import Q


@api_view(["GET"])
def search_cards(request):
    """
    /api/search/cards/?q=foo
    Simple title search across cards.
    """
    query = request.query_params.get("q", "").strip()
    qs = Card.objects.all()
    if query:
        qs = qs.filter(title__icontains=query)
    serializer = CardSerializer(qs, many=True)
    return Response(serializer.data)
