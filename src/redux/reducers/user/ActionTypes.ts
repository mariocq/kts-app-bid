import { createAction } from 'redux-act';

const ActionTypes = {
    //设置用户数据的UserInfo
    fnSetUserInfo:createAction("$$UI/User/fnSetUserInfo"),
};

export default ActionTypes;