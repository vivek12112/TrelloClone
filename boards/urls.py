from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BoardViewSet, ListViewSet, CardViewSet, search_cards  # <-- ADD search_cards HERE

router = DefaultRouter()
router.register("boards", BoardViewSet, basename="board")
router.register("lists", ListViewSet, basename="list")
router.register("cards", CardViewSet, basename="card")

urlpatterns = [
    path("", include(router.urls)),
    path("search/cards/", search_cards, name="search-cards"),  # <-- now imported
]
