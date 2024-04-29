import LogingFooter from '@/components/Footer/Login';
import { LockOutlined, CommentOutlined, UserOutlined, TwitchOutlined } from '@ant-design/icons';
import { LoginForm, ProFormCaptcha, ProFormText } from '@ant-design/pro-components';

import { getLoginUserUsingGet, sendCaptchaUsingPost, sendForgetCaptchaUsingPost, userForgetUsingPost, userLoginUsingPost, userRegisterUsingPost } from '@/services/BI/userController';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Helmet, history, useModel } from '@umijs/max';
import { Button, Tabs, message, Modal, Form } from 'antd';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';

const Login: React.FC = () => {
  const [type, setType] = useState<string>('account');
  const { setInitialState } = useModel('@@initialState');
  const [isModalVisibleRegister, setModalVisibleRegister] = useState(false);
  const [isModalVisibleForget, setModalVisibleForget] = useState(false);
  const [form] = Form.useForm();

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
  const fetchUserInfo = async () => {
    const userInfo = await getLoginUserUsingGet();
    if (userInfo) {
      flushSync(() => {
        // @ts-ignore
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };
  const handleSubmit = async (values: API.UserLoginRequest) => {
    try {
      // 登录
      const res = await userLoginUsingPost(values);
      if (res.code === 0) {
        const defaultLoginSuccessMessage = '登录成功！';
        message.success(defaultLoginSuccessMessage);
        await fetchUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        // 强制刷新让用户信息初始化出来
        window.location.reload();
        return;
      } else {
        message.error(res.msg);
      }
    } catch (error) {
      const defaultLoginFailureMessage = '登录失败，请重试！';
      message.error(defaultLoginFailureMessage);
    }
  };

  const handleRegister = () => {
    setModalVisibleRegister(true);
  };

  const handleForget = () => {
    setModalVisibleForget(true);
  };

  const handleSaveRegister = async () => {
    try {
      const register: API.UserRegisterRequest = {
        nickname: form.getFieldValue('nickname'),
        userEmail: form.getFieldValue('userEmail'),
        userPassword: form.getFieldValue('userPassword'),
        checkPassword: form.getFieldValue('checkPassword'),
        captcha: form.getFieldValue('captcha'),
      }
      // 注册
      const res = await userRegisterUsingPost(register);
      if (res.code === 0) {
        message.success('注册成功！');
        setModalVisibleRegister(false)
        return;
      } else {
        message.error(res.msg);
      }
    } catch (error) {
      message.error('注册失败，请重试！');
    }
  }

  const handleSaveForget = async () => {
    try {
      const forget: API.UserForgetRequest = {
        userEmail: form.getFieldValue('userEmail'),
        userPassword: form.getFieldValue('userPassword'),
        checkPassword: form.getFieldValue('checkPassword'),
        captcha: form.getFieldValue('captcha'),
      }
      // 注册
      const res = await userForgetUsingPost(forget);
      if (res.code === 0) {
        message.success('修改成功！');
        setModalVisibleForget(false)
        return;
      } else {
        message.error(res.msg);
      }
    } catch (error) {
      message.error('修改失败，请重试！');
    }
  }

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

  const handleGetCaptchaForget = async () => {
    try {
      const emailRegex = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      const userEmail = form?.getFieldValue('userEmail');
      if (emailRegex.test(userEmail)) {
        const res = await sendForgetCaptchaUsingPost({
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
          {'登录'}- {Settings.title}
        </title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
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
                label: '账户密码登录',
              },
            ]}
          />

          <>
            <ProFormText
              id='userEmail'
              fieldProps={{
                size: 'large',
                prefix: <CommentOutlined />,
              }}
              name="userEmail"
              placeholder={'请输入邮箱'}
              rules={[
                {
                  required: true,
                  message: '请输入邮箱！',
                },
                {
                  pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
                  message: '邮箱格式错误！',
                },
              ]}
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
              ]}
            />
          </>

          <div
            style={{
              marginBottom: 24,
            }}
          >
            <Button type="link" style={{ fontSize: 16 }} onClick={handleRegister}>
              注册
            </Button>
            <Button type="link" style={{ fontSize: 16, float: 'right' }} onClick={handleForget}>
              忘记密码？
            </Button>
          </div>
        </LoginForm>
      </div>
      <LogingFooter />

      <Modal
        title="注册"
        open={isModalVisibleRegister}
        onOk={handleSaveRegister}
        onCancel={() => setModalVisibleRegister(false)}
      >
        <Form form={form} layout="vertical">
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
                prefix: <TwitchOutlined className={'prefixIcon'} />,
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
        </Form>
      </Modal>

      <Modal
        title="忘记密码"
        open={isModalVisibleForget}
        onOk={handleSaveForget}
        onCancel={() => setModalVisibleForget(false)}
      >
        <Form form={form} layout="vertical">
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '修改密码',
              },
            ]}
          />
          <>
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
                prefix: <TwitchOutlined className={'prefixIcon'} />,
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
              onGetCaptcha={handleGetCaptchaForget}
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
        </Form>
      </Modal>
    </div>
  );
};
export default Login;
