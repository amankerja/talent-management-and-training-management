declare module 'treant-js' {
  const Treant: any;
  export default Treant;
}

declare module 'raphael' {
  const Raphael: any;
  export default Raphael;
}

interface Window {
  Raphael: any;
  Treant: any;
}
