from rest_framework import serializers
from .models import Board, List, Card


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = [
            "id",
            "list",
            "title",
            "description",
            "position",
            "due_date",
            "archived",
            "created_at",
            "updated_at",
        ]


class ListSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)

    class Meta:
        model = List
        fields = [
            "id",
            "board",
            "title",
            "position",
            "cards",
            "created_at",
            "updated_at",
        ]


class BoardSerializer(serializers.ModelSerializer):
    lists = ListSerializer(many=True, read_only=True)

    class Meta:
        model = Board
        fields = [
            "id",
            "title",
            "background",
            "lists",
            "created_at",
            "updated_at",
        ]

