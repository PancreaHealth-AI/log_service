import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { promisify } from 'util';

export interface UserRoleGrpc {
  assignment_id: string;
  role_id: string;
  role_name: string;
  role_code: string;
  role_type: string;
  scope_type: string;
  scope_id: string;
  hospital_id: string;
  department_id: string;
  service_id: string;
}

@Injectable()
export class RbacGrpcClient implements OnModuleInit {
  private client: any;
  private checkPermissionAsync: (req: any) => Promise<any>;
  private getUserRolesAsync: (req: any) => Promise<any>;
  private readonly logger = new Logger(RbacGrpcClient.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const protoPath = this.configService.get<string>(
      'RBAC_PROTO_PATH',
      './src/proto/rbac.proto',
    );
    const url = this.configService.get<string>(
      'RBAC_GRPC_URL',
      'localhost:3003',
    );

    const packageDefinition = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const rbacProto = grpc.loadPackageDefinition(packageDefinition).rbac as any;
    this.client = new rbacProto.RBACService(
      url,
      grpc.credentials.createInsecure(),
    );

    this.checkPermissionAsync = promisify(this.client.CheckPermission).bind(
      this.client,
    );

    this.getUserRolesAsync = promisify(this.client.GetUserRoles).bind(
      this.client,
    );
  }

  async checkPermission(
    userId: string,
    permissionCode: string,
    assignmentId?: string,
  ): Promise<boolean> {
    try {
      const response = await this.checkPermissionAsync({
        user_id: userId,
        permission_code: permissionCode,
        assignment_id: assignmentId ?? '',
      });
      console.log(`gRPC checkPermission response: ${JSON.stringify(response)}`);
      return response.has_permission;
    } catch (err) {
      this.logger.error(`gRPC checkPermission error: ${err.message}`);
      return false;
    }
  }

  async getUserRoles(userId: string): Promise<UserRoleGrpc[]> {
    try {
      console.log(
        `cote client Auth:gRPC getUserRoles request: userId=${userId}`,
      );
      const response = await this.getUserRolesAsync({ user_id: userId });
      return response.roles ?? [];
    } catch (err) {
      this.logger.error(`gRPC getUserRoles error: ${err.message}`);
      return [];
    }
  }
}
