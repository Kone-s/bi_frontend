import { QuestionCircleOutlined } from '@ant-design/icons';
import '@umijs/max';
export const Question = () => {
  return (
    <div
      style={{
        display: 'flex',
        height: 26,
      }}
      onClick={() => {
        window.open('https://github.com/Kone-s');
      }}
    >
      <QuestionCircleOutlined />
    </div>
  );
};
