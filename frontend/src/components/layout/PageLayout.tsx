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
	maxWidth = '2xl',
}) => {
	return (
		<div className="w-full flex flex-col gap-6">
			<div
				className={`w-full mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${maxWidthMap[maxWidth]}`}>
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-zinc-900">{title}</h1>
					{description && <p className="text-sm text-zinc-500 mt-1">{description}</p>}
				</div>
				{actions && <div className="flex items-center gap-2">{actions}</div>}
			</div>

			<div className={`w-full mx-auto ${maxWidthMap[maxWidth]}`}>{children}</div>
		</div>
	);
};
