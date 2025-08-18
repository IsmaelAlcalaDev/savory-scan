
import { useNavigate } from 'react-router-dom';

export const useNavigation = () => {
  const navigateRouter = useNavigate();

  const navigate = (path: string) => {
    navigateRouter(path);
  };

  return { navigate };
};
