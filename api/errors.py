"""A list of errors"""

class SecurityError(Exception):
    """Raise when a Security Issue is present"""
    def __init__(self, message):
        """The error constructor"""
        # Call the base class constructor with the parameters it needs
        super().__init__(message)
