import React, { useState, useCallback,useEffect,Suspense } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';

//import Users from './user/pages/Users';
//import NewPlace from './places/pages/NewPlace';
//import UserPlaces from './places/pages/UserPlaces';
//import UpdatePlace from './places/pages/UpdatePlace';
//import Auth from './user/pages/Auth';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import LoadingSpinner from './shared/components/UIElements/LoadingSpinner';
import { AuthContext } from './shared/context/auth-context';

const Users= React.lazy(()=>import('./user/pages/Users'));
const NewPlace= React.lazy(()=>import('./places/pages/NewPlace'))
const UserPlaces= React.lazy(()=>import('./places/pages/UserPlaces'))
const UpdatePlace= React.lazy(()=>import('./places/pages/UpdatePlace'))
const Auth= React.lazy(()=>import('./user/pages/Auth'))
//const MainNavigation= React.lazy(()=>import('./shared/components/Navigation/MainNavigation'))

let tokenTimer;
const App = () => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(false);
   const [tokenExpirationDate,setTokenExpirationDate]=useState();

  const login = useCallback((uid,token,expirationDate) => {
    setToken(token);
    setUserId(uid);
    const tokenExpiration= expirationDate || new Date(new Date().getTime()*1000*60*60);
    setTokenExpirationDate(tokenExpiration)
    localStorage.setItem('userData',JSON.stringify({userId:uid,
      token:token,
    expirationDate:tokenExpiration.toISOString()
  }))
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    setTokenExpirationDate(null);
    localStorage.removeItem('userData')
  }, []);
  useEffect(()=>{
    if(token && tokenExpirationDate){
       const remainingTime=tokenExpirationDate.getTime() - new Date().getTime();
       tokenTimer=setTimeout(logout,remainingTime);
    }
    else{
       clearTimeout(tokenTimer);
    }
  },[logout,token,tokenExpirationDate])
  useEffect(()=>{
    const storedData= JSON.parse(localStorage.getItem('userData'));
      if(storedData && storedData.token && new Date(storedData.tokenExpiration) > new Date()){
        login(storedData.userId,storedData.token,new Date(storedData.tokenExpiration));
      }
  },[login])

  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/places/new" exact>
          <NewPlace />
        </Route>
        <Route path="/places/:placeId">
          <UpdatePlace />
        </Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/auth">
          <Auth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: token,
        token:token,
        userId: userId,
        login: login,
        logout: logout
      }}
    >
      <Router>
        <MainNavigation />
        <main> <Suspense fallback={<div className="center" >
           <LoadingSpinner />
            </div>} >
              {routes}
              </Suspense> </main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
