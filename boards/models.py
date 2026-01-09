from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Board(TimeStampedModel):
    title = models.CharField(max_length=255)
    background = models.CharField(max_length=50, blank=True, default="#0079bf")

    def __str__(self) -> str:
        return self.title


class List(TimeStampedModel):
    board = models.ForeignKey(
        Board, on_delete=models.CASCADE, related_name="lists"
    )
    title = models.CharField(max_length=255)
    position = models.FloatField(default=0)

    class Meta:
        ordering = ["position"]

    def __str__(self) -> str:
        return f"{self.title} ({self.board_id})"


class Card(TimeStampedModel):
    list = models.ForeignKey(
        List, on_delete=models.CASCADE, related_name="cards"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    position = models.FloatField(default=0)
    due_date = models.DateTimeField(null=True, blank=True)
    archived = models.BooleanField(default=False)

    class Meta:
        ordering = ["position"]

    def __str__(self) -> str:
        return self.title
