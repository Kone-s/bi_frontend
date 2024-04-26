import Footer from '@/components/Footer';
import { LockOutlined, UserOutlined, CommentOutlined } from '@ant-design/icons';
import { Link } from '@@/exports';
import { LoginForm, ProFormText, ProFormCaptcha, ProFormInstance, ProForm } from '@ant-design/pro-components';
import { userRegisterUsingPost, sendCaptchaUsingPost } from '@/services/BI/userController';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Helmet, history } from '@umijs/max';
import { Tabs, message } from 'antd';
import React, { useState, useRef } from 'react';
import Settings from '../../../../config/defaultSettings';

const Register: React.FC = () => {
  // const [] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('account');
  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    };
  });

  const formRef = useRef<ProFormInstance>();
  const [form] = ProForm.useForm();

  const handleSubmit = async (values: API.UserRegisterRequest) => {
    if (values.checkPassword !== values.userPassword) {
      message.error('两次输入的密码不一致！');
      return;
    }
    try {
      // 登录
      const res = await userRegisterUsingPost(values);
      if (res.code === 0) {
        const defaultLoginSuccessMessage = '注册成功！';
        message.success(defaultLoginSuccessMessage);
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/user/login');
        return;
      } else {
        message.error(res.msg);
      }
    } catch (error) {
      const defaultLoginFailureMessage = '注册失败，请重试！';
      message.error(defaultLoginFailureMessage);
    }
  };

  const handleGetCaptcha = async () => {
    try {
      const emailRegex = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      const userEmail = form?.getFieldValue('userEmail');
      if (emailRegex.test(userEmail)) {
        const res = await sendCaptchaUsingPost({
          userEmail: userEmail,
        })
        if (res.code === 0) {
          message.success("验证码已发送至邮箱,请注意查收！");
        }
      }
    } catch (error: any) {
      message.error("校验码发送失败");
    }
  };

  return (
    <div className={containerClassName}>
      <Helmet>
        <title>
          {'注册'}- {Settings.title}
        </title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
        form={form} 
          submitter={{
            searchConfig: {
              submitText: '注册',
            },
          }}
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="BI 平台"
          subTitle={'AI 智能分析数据'}
          onFinish={async (values) => {
            await handleSubmit(values as API.UserLoginRequest);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '邮箱密码注册',
              },
            ]}
          />
          <>
            <ProFormText
              name="nickname"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined />,
              }}
              placeholder={'请输入昵称'}
              rules={[
                {
                  required: true,
                  message: '请输入昵称！',
                },
              ]}
            />
            <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <CommentOutlined />,
                }}
                name="userEmail"
                placeholder={'请输入邮箱'}
                rules={[
                  {
                    required: true,
                    message: '邮箱是必填项！',
                  },
                  {
                    pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                    message: '不合法的邮箱！',
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={'prefixIcon'} />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={'请输入验证码'}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${'后重新获取'}`;
                  }
                  return '获取验证码';
                }}
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: '请输入6位验证码！',
                  }
                ]}
                onGetCaptcha={handleGetCaptcha}
              />
            <ProFormText.Password
              name="userPassword"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined />,
              }}
              placeholder={'请输入密码'}
              rules={[
                {
                  required: true,
                  message: '密码是必填项！',
                },
                {
                  min: 8,
                  message: '密码不少于8位',
                },
              ]}
            />
            <ProFormText.Password
              name="checkPassword"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined />,
              }}
              placeholder={'请再次输入密码'}
              rules={[
                {
                  required: true,
                  message: '密码是必填项！',
                },
                {
                  min: 8,
                  message: '密码不少于8位',
                },
              ]}
            />
          </>

          <div
            style={{
              marginBottom: 24,
            }}
          >
            <Link to="/user/login">已注册？</Link>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};
export default Register;
