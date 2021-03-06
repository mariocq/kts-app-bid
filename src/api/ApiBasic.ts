import { Response } from 'kts-scaffold-framework/server';
import { Agent, Request } from 'kts-scaffold-framework/server';
import { reducers, MyStore } from 'src/redux';
import { history } from 'src/routes';
import { message } from 'antd';

export default abstract class ApiBasic<O, D> {

    constructor() {
        this.api  = this.api.bind(this);
        this.call = this.api.bind(this);
    }

    /** 向服务器发送请求 */
    public async call (request: Request, mock: boolean = false): Promise<any> {

        const { user } = MyStore.instance.getState();
        request.options.Authorization = user.cToken;

        MyStore.instance.dispatch(reducers.system.ActionTypes.addLoading, request.uri); // 添加loading

        const res = await Agent.instance.call(request, this.domain, mock);

        MyStore.instance.dispatch(reducers.system.ActionTypes.removeLoading, request.uri); // 删除loading

        // 通信错误
        try {
            if (res.er) {
                this.messageError(request, '服务器异常');
                return res;
            }

            // 通行错误
            if (res.res.ok === false) {
                this.messageError(request, '系统异常');
                return new Response(res.res);
            }

            // 业务失败
            if (res.res.body.ok === false) {
                if (res.res.body.status && res.res.body.status.description) {
                    if (res.res.body.status.returnCode === '02001') {
                        MyStore.instance.dispatch(reducers.user.ActionTypes.fnSetUserInfo, { token: null });
                        history.push('/');
                    }
                    this.messageError(request, res.res.body.status.description);
                } else {
                    this.messageError(request, '系统错误');
                }
                return new Response(res.res);
            }
        } catch (er) {
            this.messageError(request, '系统错误');
            return new Response(res.res);
        }

        return new Response(null, res.res.body.body);
    }

    /**
     * 执行api
     * @param option api 入参
     */
    public run = async (target: any, option: O): Promise<Response<D>> => {
        return await this.api(option);
    }

    /** 
     * 抽象方法（子类api逻辑的实现入口） 
     * @param option api 入参
     */
    protected async api(option: O): Promise<Response<D>> {
        throw '请重写api方法';
    }

    /** 发送消息 */
    private messageError(request: Request, text: string) {
        if (request.isMessage) {
            message.error(text);
        }
    }

    /** 请求头（全局） */
    private get domain(): string {
        const { user, env } = MyStore.instance.getState();
        return env.DURL || user.zoneUrl;
    }
}