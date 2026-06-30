from .router import router

name = "rugby-teams"
metadata = None
migration_dir = None

module = type("AppModule", (), {
    "name": name,
    "router": router,
    "metadata": metadata,
    "migration_dir": migration_dir,
})()
