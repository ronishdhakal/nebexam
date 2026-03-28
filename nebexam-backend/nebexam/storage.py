import re
from storages.backends.s3boto3 import S3Boto3Storage


class HyphenatedS3Storage(S3Boto3Storage):
    def get_valid_name(self, name):
        name = super().get_valid_name(name)
        return name.replace('_', '-')
