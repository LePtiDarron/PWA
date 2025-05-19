import { useState } from 'react';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import Chat from './components/Chat';

function App() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className='container py-4'>
      <div className='card card-body'>
        <div className='row'>
          <div className='col-md-4'>
            <UserForm onUserCreated={() => setRefresh(r => r + 1)} />
          </div>
          <div className='col-md-8'>
            <Chat />
          </div>
        </div>
      </div>
      <div className='card card-body'>
        <UserList refreshTrigger={refresh} />
      </div>
    </div>
  );
}

export default App;
