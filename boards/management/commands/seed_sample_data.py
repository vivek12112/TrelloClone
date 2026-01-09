from django.core.management.base import BaseCommand
from django.db import transaction

from boards.models import Board, List, Card


class Command(BaseCommand):
    help = "Seed database with a sample board, lists and cards"

    @transaction.atomic
    def handle(self, *args, **options):
        # Skip if data already exists
        if Board.objects.exists():
            self.stdout.write(
                self.style.WARNING("Boards already exist, skipping seed.")
            )
            return

        # Create sample board
        board = Board.objects.create(title="Sample Project")

        # Create lists
        todo_list = List.objects.create(
            board=board, title="To Do", position=1000
        )
        doing_list = List.objects.create(
            board=board, title="Doing", position=2000
        )
        done_list = List.objects.create(
            board=board, title="Done", position=3000
        )

        # Create cards
        Card.objects.create(
            list=todo_list,
            title="Design database schema",
            description="Create models for boards, lists, cards",
            position=1000,
        )
        Card.objects.create(
            list=todo_list,
            title="Set up Django REST API",
            description="Implement CRUD endpoints with DRF",
            position=2000,
        )
        Card.objects.create(
            list=doing_list,
            title="Build React frontend",
            description="Trello-style UI with drag-and-drop",
            position=1000,
        )
        Card.objects.create(
            list=done_list,
            title="Deploy to Render/Vercel",
            description="Backend on Render, frontend on Vercel",
            position=1000,
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded {board} with 3 lists and 4 cards!"
            )
        )
