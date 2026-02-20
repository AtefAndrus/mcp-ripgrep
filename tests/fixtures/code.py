def hello_world():
    """Say hello in multiple languages."""
    messages = {
        "en": "Hello, World!",
        "ja": "こんにちは、世界！",
        "fr": "Bonjour le monde!",
    }
    for lang, msg in messages.items():
        print(f"[{lang}] {msg}")


class Calculator:
    def add(self, a: int, b: int) -> int:
        return a + b

    def multiply(self, a: int, b: int) -> int:
        return a * b
