// import { CHART_STATUS } from '@/constants/chart/chartStatus';
import { CHART_TYPE_JSON } from '@/constants/chart/chartType';
import CreateChartModal from '@/pages/Admin/Chart/components/CreateChartModal';
import UpdateChartModal from '@/pages/Admin/Chart/components/UpdateChartModal';
import { deleteChartUsingPOST, listChartByPageUsingPOST } from '@/services/BI/chartController';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Divider, message, Modal, Popconfirm, Space, Typography } from 'antd';
import React, { useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';

export const waitTimePromise = async (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export const waitTime = async (time: number = 100) => {
  await waitTimePromise(time);
};

/**
 * 图表管理页面
 * @constructor
 */
const AdminChartPage: React.FC<unknown> = () => {
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [updateData, setUpdateData] = useState<API.Chart>({});
  const actionRef = useRef<ActionType>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   *  删除节点
   * @param selectedRows
   */
  const doDelete = async (selectedRows: API.Chart[]) => {
    const hide = message.loading('正在删除');
    if (!selectedRows) return true;
    try {
      await deleteChartUsingPOST({
        id: selectedRows.find((row) => row.id)?.id || 0,
      });
      message.success('操作成功');
      actionRef.current?.reload();
    } catch (e: any) {
      message.error('操作失败，' + e.message);
    } finally {
      hide();
    }
  };

  const [currentChartData, setCurrentChartData] = useState(null);

  const handleViewChart = (genChart) => {
    setCurrentChartData(genChart); // 设置当前图表数据
    setIsModalOpen(true); // 打开模态框
  };

  const handleCancel = () => {
    setCurrentChartData(null);
    setIsModalOpen(false); // 关闭模态框
  };

  /**
   * 表格列配置
   */
  const columns: ProColumns<API.Chart>[] = [
    {
      title: 'id',
      dataIndex: 'id',
      valueType: 'index',
    },
    {
      title: '图表名称',
      dataIndex: 'chartName',
      valueType: 'text',
    },
    {
      title: '图表类型',
      dataIndex: 'chartType',
      valueType: 'text',
      valueEnum: CHART_TYPE_JSON,
    },
    {
      title: '原始数据',
      dataIndex: 'chartData',
      valueType: 'text',
      ellipsis: true,
      tooltip: '过长会自动收缩'
    },
    {
      title: '分析目标',
      dataIndex: 'goal',
      valueType: 'textarea',
      ellipsis: true,
      tooltip: '过长会自动收缩'
    },
    {
      title: 'AI生成图表数据',
      dataIndex: 'genChart',
      valueType: 'text',
      render: (_, record) => {
        return (
          <>
            <Typography.Link
              onClick={() => {
                handleViewChart(record.genChart);
              }}
            >
              查看
            </Typography.Link>
            <Modal
              title="图表"
              forceRender
              width={'70%'}
              open={isModalOpen}
              onCancel={() => {
                handleCancel();
              }}
              footer={null}
            >
              <ReactECharts notMerge style={{height: '500px'}} option={JSON.parse(currentChartData ?? '{}')} />
            </Modal>
          </>
        );
      },
    },
    {
      title: 'AI分析结论',
      dataIndex: 'genResult',
      valueType: 'textarea',
      ellipsis: true,
      tooltip: '过长会自动收缩'
    },
    {
      title: '生成状态',
      dataIndex: 'chartStatus',
      valueType: 'text',
      valueEnum: {
        error: {
          text: '失败',
          status: 'Default',
        },
        succeed: {
          text: '成功',
          status: 'Success',
          disabled: true,
        },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      hideInForm: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      hideInForm: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <Space split={<Divider type="vertical" />}>
          <Typography.Link
            onClick={() => {
              setUpdateData(record);
              setUpdateModalVisible(true);
            }}
          >
            修改
          </Typography.Link>
          <Popconfirm
            title="您确定要删除么？"
            onConfirm={() => doDelete([record])}
            okText="确认"
            cancelText="取消"
          >
            <Typography.Link type="danger">删除</Typography.Link>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.Chart>
        headerTitle="图表管理"
        actionRef={actionRef}
        loading={loading}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button key="1" type="primary" onClick={() => setCreateModalVisible(true)}>
            新建
          </Button>,
        ]}
        request={async (params, sorter) => {
          setLoading(true);
          const searchParams: API.ChartQueryRequest = {
            ...params,
            sortField: 'create_time',
            sortOrder: 'desc',
          };
          await waitTime(500);
          const { data, code } = await listChartByPageUsingPOST(searchParams);
          setLoading(false);
          return {
            data: data?.records || [],
            success: code === 0,
            total: data?.total,
          } as any;
        }}
        columns={columns}
      />
      <CreateChartModal
        modalVisible={createModalVisible}
        columns={columns}
        onSubmit={() => { }}
        onCancel={() => setCreateModalVisible(false)}
      />
      <UpdateChartModal
        oldData={updateData}
        modalVisible={updateModalVisible}
        columns={columns}
        onSubmit={() => { }}
        onCancel={() => setUpdateModalVisible(false)}
      />
    </PageContainer>
  );
};

export default AdminChartPage;
