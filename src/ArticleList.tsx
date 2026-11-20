import { ARTICLES, type Article } from './articles';

function ArticleCard({ article }: { article: Article }) {
  return (
    <a className="article" href={article.url} target="_blank" rel="noopener noreferrer">
      <img
        className="article__image"
        src={article.image}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <div className="article__body">
        <h3 className="article__title">{article.title}</h3>
        <p className="article__summary">{article.summary}</p>
        <p className="article__meta">
          {article.source} · {article.date}
        </p>
      </div>
    </a>
  );
}

export function ArticleList() {
  return (
    <section className="articles" aria-labelledby="articles-heading">
      <h2 id="articles-heading" className="articles__heading">
        Báo viết về chúng tôi
      </h2>
      <ul className="articles__list">
        {ARTICLES.map((article) => (
          <li key={article.url}>
            <ArticleCard article={article} />
          </li>
        ))}
      </ul>
    </section>
  );
}
