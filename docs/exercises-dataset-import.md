# Exercises Dataset import

Source: https://github.com/hasaneyldrm/exercises-dataset

YOU GYM imports 1,324 exercise records from the repository's
`data/exercises.json` file at backend startup. The import is idempotent and
stores catalog fields in `exercise_catalog`, image/GIF links in
`exercise_resource`, and multilingual instructions plus source metadata in
`exercise_dataset_detail`.

Dataset structure and instruction text are provided under the source
repository's MIT license.

The referenced thumbnail and GIF media remain the property of Gym visual.
Keep this attribution visible wherever the media is displayed:

`© Gym visual — https://gymvisual.com/`

Review the source repository's `LICENSE` and `NOTICE.md` before production
media use. The database stores GitHub Raw links and does not copy the media
files into YOU GYM.
