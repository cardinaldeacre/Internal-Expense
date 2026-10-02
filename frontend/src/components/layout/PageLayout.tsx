import React from 'react';

type PageLayoutProps = {
	title: string;
	description?: string;
	actions?: React.ReactNode;
	children: React.ReactNode;
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
};

const maxWidthMap: Record<NonNullable<PageLayoutProps['maxWidth']>, string> = {
	sm: 'max-w-md',
	md: 'max-w-2xl',
	lg: 'max-w-4xl',
	xl: 'max-w-6xl',
	'2xl': 'max-w-7xl',
};

export const PageLayout: React.FC<PageLayoutProps> = ({
	title,
	description,
	actions,
	children,
	maxWidth = 'lg',
}) => {
	return (
		<div className="min-h-screen bg-zinc-50">
			<header className="border-b bg-white">
				<div
					className={`mx-auto flex items-center justify-between gap-4 px-6 py-5 ${maxWidthMap[maxWidth]}`}>
					<div>
						<h1 className="text-2xl font-bold tracking-tight text-zinc-900">{title}</h1>
						{description && <p className="text-sm text-zinc-500 mt-1">{description}</p>}
					</div>
					{actions && <div className="flex items-center gap-2">{actions}</div>}
				</div>
			</header>

			<main className={`mx-auto px-6 py-8 ${maxWidthMap[maxWidth]}`}>{children}</main>
		</div>
	);
};
