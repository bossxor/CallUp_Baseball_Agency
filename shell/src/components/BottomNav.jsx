const ROUTES = [['brief', '브리핑'], ['roster', '선수단'], ['scout', '스카우트'], ['contracts', '계약']];

export default function WorkspaceNav({ route, onChange }) {
  return (
    <nav className="workspace-nav" aria-label="콜업 메뉴">
      {ROUTES.map(([page, label]) => (
        <button key={page} aria-current={route === page ? 'page' : undefined} onClick={() => onChange(page)}>
          {label}
        </button>
      ))}
    </nav>
  );
}
