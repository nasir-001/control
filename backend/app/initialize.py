#!/usr/bin/env python
# -=-<[ Bismillahirrahmanirrahim ]>-=-
# -*- coding: utf-8 -*-
# @Date    : 2021-05-07 18:28:58
# @Author  : Dahir Muhammad Dahir
# @Description : from Bill's template codebase

import logging
from sqlalchemy.exc import ProgrammingError

from config.init_db import init_db
from config.db import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('FastAPI Template')

def init() -> None:
    db = SessionLocal()
    init_db(db)


def main() -> None:
    try:
        logger.info('Creating initial data')
        init()
        logger.info('Initial data created')
    except ProgrammingError:
        logger.error(
            ' Cannot find tables on your database. '
            'Have you ran migrations with "alembic upgrade head"?'
        )

if __name__ == "__main__":
    main()