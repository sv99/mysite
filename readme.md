# Personal site

На базе [OptimizedHTML 5](https://github.com/agragregra/oh5)

Сайт для проекта можно публикуется по умолчанию из ветки gh-pages.
В эту ветку сливаем каталог src/ при помощи

```bash
gh-pages -d src
# or
yarn deploy
```

[https://sv99.github.io/mysite/](https://sv99.github.io)


## Запуска

```bash
gulp
```

## Публикация изменений

```bash
git add .
git commit -m "message..."
git push origin master
```

## Github Pages from directory src/

```bash
git subtree push --prefix src origin gh-pages
```
