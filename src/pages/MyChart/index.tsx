import { useModel } from '@@/exports';
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useRef, useState } from 'react';
import { deleteChartUsingPOST, listMyChartByPageUsingPOST, reloadChartByAiUsingGET } from '@/services/BI/chartController';
import { EyeOutlined, ExclamationCircleFilled, DeleteOutlined, EllipsisOutlined, DownloadOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-table';
import ProList from '@ant-design/pro-list';
import UpdateChartModal from './components/UpdateChartModal';
import {
  Button,
  Collapse,
  Dropdown,
  MenuProps,
  message,
  Modal,
  Result,
  Space,
  Tag,
  Typography,
} from 'antd';
import { ProListMetas } from '@ant-design/pro-list/lib';
import { CHART_TYPE } from '@/constants/chart/chartType';

/**
 * 我的图表页面
 * @constructor
 */
const MyChartPage: React.FC = () => {
  //默认搜索参数
  const initSearchParams = {
    chartName: '',
    chartType: '',
    current: 1,
    pageSize: 2,
    sortField: 'create_time',
    sortOrder: 'desc',
  };

  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({ ...initSearchParams });
  const { initialState } = useModel('@@initialState');
  const [chartList, setChartList] = useState<API.Chart[]>();
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [chartId, setChartId] = useState<number>(0);
  const actionRef = useRef<ActionType>();
  const [updateData, setUpdateData] = useState<API.Chart>({});
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
  const [disableOption, setDisableOption] = useState<boolean>(false);

  /**
   * 加载数据
   */
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listMyChartByPageUsingPOST(searchParams);
      if (res.data) {
        // 拿到分页的数据
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
        if (res.data.records) {
          res.data.records.forEach((data) => {
            const chartOption = JSON.parse(data.genChart || '{}');
            if (chartOption.title) chartOption.title = undefined;
            data.genChart = JSON.stringify(chartOption);
          });
        }
      } else message.error('获取图表失败');
    } catch (e: any) {
      message.error('获取我的图表失败' + e.message);
    }
    setLoading(false);
  };

  /**
 * 手动重新生成图表
 * @param params
 */
  const reloadChart = async (params: number) => {
    const data = {
      chartId: params,
    };
    try {
      const res = await reloadChartByAiUsingGET(data);
      if (res.code === 0 && data) {
        message.success('请求成功，图表生成中请稍后');
        loadData();
      } else {
        message.error('重新生成图表失败');
      }
    } catch (e: any) {
      message.error('重新生成图表失败', e.message);
    }
  };


  useEffect(() => {
    loadData();
  }, [searchParams]);


  /**
 * 删除图表数据
 * @param params
 */
  const handleDelete = async (params: number) => {
    if (params <= 0 || params === undefined) {
      message.error('图表id为空');
      return;
    }
    const data = {
      id: params,
    };
    try {
      const res = await deleteChartUsingPOST(data);
      if (res.code === 0 && data) {
        message.success('删除成功');
        setChartId(0);
        //todo 列表刷新失效
        if (actionRef.current) {
          actionRef.current.reload();
        }
      } else {
        message.error('删除失败');
      }
    } catch (e: any) {
      message.error('删除失败', e.message);
    }
  };

  const chartRefs = useRef({}); // 使用 useRef 来存储图表的 ref

  const downloadChart = (chartId: number) => {
    const chartRef = chartRefs.current[chartId];
    if (chartRef) {
      const instance = chartRef.getEchartsInstance();
      const imgData = instance.getDataURL({
        pixelRatio: 2, // 提高图片清晰度
        backgroundColor: '#fff' // 设置背景颜色
      });
      downloadImage(imgData);
    }
  };

  const downloadImage = (dataUrl: string) => {
    const timestamp = Math.floor(Date.now() / 1000); // 获取当前时间的秒数时间戳
    const filename = `chart-${timestamp}.png`; // 使用时间戳作为文件名

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename; // 设置下载文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  /**
 * 操作 下拉菜单：查看原始数据、删除
 */
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <Space
          onClick={() => {
            setUpdateModalVisible(true);
          }}
        >
          <EyeOutlined />
          <Typography.Link>编辑</Typography.Link>
        </Space>
      ),
      disabled: disableOption,
    },
    {
      key: '2',
      label: (
        <Space
          onClick={() => {
            downloadChart(chartId);
          }}
        >
          <DownloadOutlined />
          <Typography.Link>下载</Typography.Link>
        </Space>
      ),
    },
    {
      key: '3',
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: '删除对话',
          icon: <ExclamationCircleFilled />,
          okType: 'danger',
          content: '确认要删除该图表吗？',
          okText: '确认',
          cancelText: '取消',
          onOk() {
            handleDelete(chartId);
          },
        });
      },
      label: (
        <Space>
          <DeleteOutlined />
          <div>删除</div>
        </Space>
      ),
    },
  ];

  /**
 * 处理图表类型
 */
  const handleType = () => {
    return CHART_TYPE.reduce((obj: any, item) => {
      obj[item.value] = item.label;
      return obj;
    }, {});
  };

  /**
 * 列表元素
 */
  const metas: ProListMetas<API.Chart> = {
    id: {
      title: 'id',
      dataIndex: 'id',
      valueType: 'index',
      search: false,
    },
    title: {
      title: '图表名称',
      dataIndex: 'chartName',
    },
    subTitle: {
      title: '图表类型',
      dataIndex: 'chartType',
      valueEnum: handleType(),
      render: (_, item) => {
        return <Tag color="#5BD8A6">{'图表类型：' + item.chartType}</Tag>;
      },
    },
    content: {
      search: false,
      render: (_, item) => {
        return (
          <div style={{ flex: 1 }}>
            <div>
              <p>{item.goal}</p>
            </div>
            {item.chartStatus === 'wait' && (
              <div>
                <Result status="warning" title="等待处理" subTitle={item.execMessage} />
              </div>
            )}
            {item.chartStatus === 'running' && (
              <div>
                <Result status="info" title="图表生成中" subTitle={item.execMessage} />
              </div>
            )}
            {item.chartStatus === 'failed' && (
              <div>
                <Result
                  status="error"
                  title="图表生成失败"
                  subTitle={item.execMessage}
                  extra={[
                    <Button
                      key="tryAgain"
                      type="primary"
                      danger
                      onClick={() => {
                        reloadChart(item.id as number);
                      }}
                    >
                      请重试
                    </Button>,
                  ]}
                />
              </div>
            )}
            {item.chartStatus === 'succeed' && (
              <div style={{ width: '100%' }}>
                <ReactECharts ref={(e) => { chartRefs.current[item.id] = e; }} option={JSON.parse(item.genChart ?? '{}')} />
              </div>
            )}
            <div>
              <Collapse
                bordered={false}
                items={[
                  {
                    key: item.id,
                    label: 'AI分析结论',
                    children: <p>{item.genResult}</p>,
                  },
                ]}
              />
            </div>
          </div>
        );
      },
    },
    actions: {
      cardActionProps: 'extra',
      render: (text, row) => {
        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottom" arrow>
            <a
              onClick={(e) => {
                e.preventDefault();
                setUpdateData(row);
                setChartId(row.id ?? 0);
                setDisableOption('succeed' !== row.chartStatus);
              }}
            >
              <EllipsisOutlined style={{ fontSize: 20 }} />
            </a>
          </Dropdown>
        );
      },
    },
  };

  return (
    <div className="my-chart-page">
      <ProList<API.Chart>
        grid={{ gutter: 16, column: 2 }}
        ghost={true}
        loading={loading}
        actionRef={actionRef}
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        request={async (params) => {
          setSearchParams({
            ...searchParams,
            chartName: params.chartName,
            chartType: params.chartType,
          });
        }}
        rowKey="id"
        pagination={{
          onChange: (page, pageSize) => {
            setSearchParams({
              ...searchParams,
              current: page,
              pageSize,
            });
          },
          current: searchParams?.current,
          pageSize: searchParams?.pageSize,
          total: total,
        }}
        dataSource={chartList}
        metas={metas}
      />
      <UpdateChartModal
        modalVisible={updateModalVisible}
        oldData={updateData}
        onSubmit={() => setUpdateModalVisible(false)}
        onCancel={() => setUpdateModalVisible(false)}
      />
    </div>
  );
};
export default MyChartPage;
