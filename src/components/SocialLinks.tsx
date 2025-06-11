import React from 'react';
import { IconBrandX, IconBrandInstagram, IconBrandLinkedin } from '@tabler/icons-react';

interface Props {
  links: {
    Twitter: string;
    Instagram: string;
    LinkedIn: string;
  };
  className?: string;
  iconSize?: number;
}

export const SocialLinks: React.FC<Props> = ({ links, className = '', iconSize = 24 }) => {
  return (
    <div className={`flex gap-4 ${className}`}>
      <a
        href={links.Twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-white transition-colors"
        title="X (formerly Twitter)"
      >
        <IconBrandX size={iconSize} />
      </a>
      <a
        href={links.Instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-white transition-colors"
        title="Instagram"
      >
        <IconBrandInstagram size={iconSize} />
      </a>
      <a
        href={links.LinkedIn}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-white transition-colors"
        title="LinkedIn"
      >
        <IconBrandLinkedin size={iconSize} />
      </a>
    </div>
  );
};