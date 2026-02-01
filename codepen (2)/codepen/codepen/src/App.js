

import Home from './componenets/Home';
import DataProvider from './context/DataProvider';

function App() {
  return (
  
    <DataProvider>
      <Home />
     </DataProvider>
    
  );
}

export default App;
