import Image from 'next/image';
import { User } from 'lucide-react';

interface Props {
  src: string | null | undefined;
  name: string | null | undefined;
  size?: number;
}

export default function Avatar({ src, name, size = 40 }: Props) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? 'Player'}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <User className="text-blue-600" style={{ width: size * 0.55, height: size * 0.55 }} />
    </div>
  );
}
