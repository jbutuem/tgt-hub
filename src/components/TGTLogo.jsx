export function TGTLogo({ className = 'h-8', color = '#ED1C24' }) {
  return (
    <svg className={className} viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0H50V16H32V80H18V16H0V0Z" fill={color}/>
      <path d="M58 0H108V16H90V32H108V48H90V64H108V80H58V64H76V48H58V32H76V16H58V0Z" fill={color}/>
      <path d="M116 0H166V16H148V80H134V16H116V0Z" fill={color}/>
      <text x="172" y="32" fill={color === '#ED1C24' ? '#ffffff' : '#231F20'} fontSize="11" fontFamily="Montserrat" fontWeight="800" letterSpacing="0.5">A AGÊNCIA</text>
      <text x="172" y="50" fill={color === '#ED1C24' ? '#999999' : '#575756'} fontSize="11" fontFamily="Montserrat" fontWeight="500" letterSpacing="0.5">ALÉM DO</text>
      <text x="172" y="68" fill={color === '#ED1C24' ? '#999999' : '#575756'} fontSize="11" fontFamily="Montserrat" fontWeight="500" letterSpacing="0.5">MARKETING</text>
    </svg>
  )
}
