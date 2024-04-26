import {
  checkInUsingPost,
  getSignByIdUsingGet,
  getUserByIdTokens,
  getUserByIdUsingGet,
} from '@/services/BI/scoreController';
import { getLoginUserUsingGet, updateMyUserUsingPost } from '@/services/BI/userController';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Avatar, Button, Card, Col, Form, Input, message, Modal, Row, Statistic, theme } from 'antd';
import React, { useEffect, useState } from 'react';

const Welcome = () => {
  const { token } = theme.useToken();
  const [isSignedIn, setSignedIn] = useState(false);
  const [userData, setUserData] = useState<API.BaseResponseLoginUserVO_>();
  const [score, setScore] = useState<API.BaseResponseLong_>();
  const [signStatus, setSignStatus] = useState<API.BaseResponseInt_>();
  const [tokens, setTokens] = useState<API.BaseResponseLong_>();

  const fetchData = async () => {
    try {
      const [userRes, scoreRes, signRes, tokensRes] = await Promise.all([
        getLoginUserUsingGet(),
        getUserByIdUsingGet(),
        getSignByIdUsingGet(),
        getUserByIdTokens()
      ]);
      if (userRes.data) {
        setUserData(userRes);
      } else {
        message.error(userRes.msg);
      }

      if (signRes.hasOwnProperty('data')) {
        setSignStatus(signRes);
      } else {
        message.error(signRes.msg);
      }

      if (scoreRes.data) {
        setScore(scoreRes);
      } else {
        message.error(scoreRes.msg);
      }

      if (tokensRes.data) {
        setTokens(tokensRes);
      } else {
        message.error(tokensRes.msg);
      }

    } catch (e) {
      message.error('获取信息失败');
    }
  };
  useEffect(() => {
    fetchData();
  }, []);


  /**
 * 签到逻辑
 */
  const handleSignIn = async () => {
    const res = await checkInUsingPost();
    if (res.data === '签到成功') {
      setSignedIn(true);
      message.success(res.data);
      fetchData();
    } else {
      message.error(res.msg);
      setSignedIn(false);
    }
  };
  const handleRecharge = () => {
    message.info('你还真想充钱呀，直接打给我吧！！！');
  };


  return (
    <PageContainer>
      <Card
        style={{
          borderRadius: 8,
        }}
      >
        <div
          style={{
            backgroundPosition: '100% -30%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '274px auto',
            backgroundImage:
              "url('https://gw.alipayobjects.com/mdn/rms_a9745b/afts/img/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ')",
          }}
        >
          <div
            style={{
              fontSize: '20px',
              color: token.colorTextHeading,
            }}
          >
            欢迎使用 BI 平台
          </div>
          <p
            style={{
              fontSize: '14px',
              color: token.colorTextSecondary,
              lineHeight: '22px',
              marginTop: 16,
              marginBottom: 32,
              width: '65%',
            }}
          >
            该 BI 平台是一个基于 讯飞星火Spark 的智能分析平台。
            您只需导入原始数据，并输入分析需求即可自动生成可视化的图表分析及其结论。
            您还可以查看分析的原始数据，当分析失败时可在我的图表手动重试。
            文件数据较大请使用批量分析以免等待时间过程影响您的体验。
            目前新注册用户可以免费调用10次（10积分，每次调用扣除1积分），当然您也可以通过签到获取更多积分。
            如需更多使用次数，请联系管理员：Motic2077
          </p>
          {/* <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <InfoCard
              href="https://github.com/Kone-s/bi_backend"
              title="相关技术"
              desc={
                '1、基于 Spring Boot + AIGC + React 的分析平台。 2、基于 ThreadPoolExecutor 创建任务队列实现Ai分析的并发执行、异步化，并使用 WebSocket 进行消息及时通知。 3、基于 Guava 的任务重试机制对分析过程失败的任务进行自动重试。 4、利用 Redis 进行图表数据的分布式缓存提高图表数据的查询速度。 5、基于 Redission 进行限流预防恶意请求。'
              }
              index={'*'}
            />
          </div> */}
          <Row gutter={16}>
            <Col span={6}>
              <Statistic title="积分" value={score?.data} />
              <Button
                type="primary"
                size="large"
                onClick={handleSignIn}
                disabled={signStatus?.data !== 0 || isSignedIn}
                style={{ fontSize: 14, width: 70, marginTop: 10 }}
              >
                <>
                  {signStatus?.data !== 0 || isSignedIn ? (
                    <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 20 }} />
                  ) : (
                    '签到'
                  )}
                </>
              </Button>
            </Col>
            <Col span={6}>
              <Statistic title="消耗 tokens 数" value={tokens?.data}/>
              <Button
                type="primary"
                style={{ marginTop: 10, fontSize: 14 }}
                size="large"
                onClick={handleRecharge}>
                充值积分
              </Button>
            </Col>
            {/* <Col span={12}>
              
            </Col> */}
          </Row>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Welcome;
