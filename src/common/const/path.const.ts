import { join } from 'path';

// 서버 절대 경로
export const PROJECT_ROOT_PATH = process.cwd();
export const PUBLIC_FOLDER_NAME = 'public';
export const ACTIVITY_FOLDER_NAME = 'activity';

// 서버 내 퍼블릭 폴더 절대 경로 / 서버 내 Activity에 저장될 이미지 절대 경로
export const PUBLIC_FOLDER_PATH = join(PROJECT_ROOT_PATH, PUBLIC_FOLDER_NAME);
export const ACTIVITY_IMAGE_PATH = join(
  PUBLIC_FOLDER_PATH,
  ACTIVITY_FOLDER_NAME,
);

// 클라이언트가 접근 할 PUBLIC 경로
// http://localhost:3000/public/~~~
// 위에서 /public/~~~ 여기를 의미!
export const ACTIVITY_PUBLIC_IMAGE_PATH = join(
  PUBLIC_FOLDER_NAME,
  ACTIVITY_FOLDER_NAME,
);
