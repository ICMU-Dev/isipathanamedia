import { createElement } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowUpRight, BookUser, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isAdmin } from '../../utils/roles';

const tools = [
  { name: 'ICMU Contacts', description: 'The people who help make it happen. Keep printers, sponsors, venues, and more in one shared directory.', path: 'contacts', Icon: BookUser, label: 'Shared directory' },
];

export default function Tools() {
  const { user } = useAuth();
  const { adminPath } = useParams();
  if (!isAdmin(user?.role)) return <Navigate to={`/${adminPath}/dashboard`} replace />;
  return (
    <div className="mx-auto w-full max-w-6xl text-theme-primary">
      <div className="mb-8">
        <p className="mb-3 text-xs opacity-45">Your workspace</p>
        <h1 className="flex items-center gap-3 text-3xl font-semibold"><Wrench size={27} className="text-[var(--accent)]" />Tools</h1>
        <p className="mt-3 text-sm opacity-55">A little help for everything behind the scenes.</p>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tools.map(({ name, description, path, Icon, label }) => <Link key={path} to={path} className="group flex min-h-64 flex-col rounded-3xl border border-theme-base bg-[var(--admin-card-bg)] p-6 transition-colors hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]">
          <div className="mb-6 flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--admin-border)] text-[var(--accent)]">{createElement(Icon, { size: 24 })}</span><ArrowUpRight size={19} className="opacity-35 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" /></div>
          <h2 className="text-lg font-semibold">{name}</h2>
          <p className="mb-6 mt-2 text-sm leading-relaxed opacity-55">{description}</p>
          <span className="mt-auto text-xs font-medium text-[var(--accent)]">{label}</span>
        </Link>)}
      </div>
    </div>
  );
}
