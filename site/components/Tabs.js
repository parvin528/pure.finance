import { Link } from '../navigation'

function Tabs({ className = '', items }) {
  const itemClassnames = 'cursor-pointer block py-3.5 text-sm'
  return (
    <ul
      className={`capitalize flex flex-wrap text-gray-400 space-x-4 ${className}`}
    >
      {items.map(({ label, href, selected, onClick = () => null }) => (
        <li
          className={`${selected ? 'border-b-2 border-black text-black' : ''} `}
          key={label}
        >
          {href ? (
            <Link className={itemClassnames} href={href} onClick={onClick}>
              {label}
            </Link>
          ) : (
            <span className={itemClassnames} onClick={onClick}>
              {label}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

export default Tabs
