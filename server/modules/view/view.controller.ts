import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class ViewController {
  @Get(['/', '*'])
  @Render('index')
  async render(): Promise<{ __platform__: string }> {
    return {
      // 独立版不再有平台注入数据
      __platform__: '{}',
    };
  }
}
