import { useEffect, useState } from 'react';
import { ArticleList } from './ArticleList';
import { PlayerBar } from './PlayerBar';
import { HistoryPage } from './history/HistoryPage';
import { Fleuron } from './history/Ornament';
import { FamilyRun } from './family/FamilyRun';

type Page = 'home' | 'history' | 'family';

const PAGES: { id: Page; label: string; hash: string }[] = [
  { id: 'home', label: 'Trang chủ', hash: '#/' },
  { id: 'history', label: 'Lịch sử', hash: '#/lich-su' },
  { id: 'family', label: 'Gia đình', hash: '#/gia-dinh' },
];

const pageFromHash = (): Page => {
  if (window.location.hash === '#/lich-su') return 'history';
  if (window.location.hash === '#/gia-dinh') return 'family';
  return 'home';
};

export default function App() {
  const [page, setPage] = useState<Page>(pageFromHash);

  useEffect(() => {
    const onHashChange = () => {
      setPage(pageFromHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <>
      <nav className="site-nav" aria-label="Trang">
        {PAGES.map((p) => (
          <a
            key={p.id}
            href={p.hash}
            className={`site-nav__link${page === p.id ? ' is-active' : ''}`}
            aria-current={page === p.id ? 'page' : undefined}
          >
            {p.label}
          </a>
        ))}
      </nav>
      <main className={`page${page === 'history' ? ' page--history' : ''}`}>
        {page === 'home' ? (
          <>
            <h1 className="page__title">Trang âm nhạc (demo)</h1>
            <Fleuron className="page__fleuron" />
            <p className="page__hint">Bấm vào ảnh hoặc tên bài ở thanh dưới để chọn bài hát.</p>
            <ArticleList />
          </>
        ) : page === 'family' ? (
          <FamilyRun />
        ) : (
          <HistoryPage />
        )}
      </main>
      {/* Trang Lịch sử không có thanh phát nhạc */}
      {page !== 'history' && <PlayerBar />}
    </>
  );
}
