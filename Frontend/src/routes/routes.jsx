// AppRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import { route_map } from './route_zmap';

export const AppRoutes = () => {
  const renderRoutes = (routes) => {
    return routes.map((route, index) => {
      if (route.children) {
        return (
          <Route key={index} path={route.path} element={route.element}>
            {renderRoutes(route.children)}
          </Route>
        );
      }
      return (
        <Route
          key={index}
          path={route.path}
          element={route.element}
          index={route.index}
        />
      );
    });
  };

  return <Routes>{renderRoutes(route_map)}</Routes>;
};