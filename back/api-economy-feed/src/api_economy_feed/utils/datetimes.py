from datetime import datetime


def transform_str_datetime_into_datetime(str_datetime: str) -> datetime:
    return datetime.strptime(str_datetime, "%Y-%m-%d %H:%M:%S")


def extract_date_from_str_datetime(str_datetime: str) -> str:
    new_datetime = transform_str_datetime_into_datetime(str_datetime)

    return new_datetime.strftime("%d/%m/%Y")


def extract_hour_from_str_datetime(str_datetime: str) -> str:
    new_datetime = transform_str_datetime_into_datetime(str_datetime)

    return new_datetime.strftime("%Hh%M")
