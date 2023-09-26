import { Logger } from '.';

const l = new Logger('logger.log',{
    groupSeparator: '|',
    levels:['vegeta']
});
const data = {
  hola: 'nundo',
};
l.group('GerUsersUsecase');
l.log('debug', data);
l.group('GerMembersUsecase');
l.log('debug', data);
l.closeGroup();
l.log('debug', data);
l.log('debug', 'La vida es muy bonita como para no vivirla.');
l.log('debug', 'La vida es muy bonita como para no vivirla 1.');
l.group('GeTeamsUsecase');
l.log('debug', 'La vida es muy bonita como para no vivirla 2.');
l.log('debug', 'La vida es muy bonita como para no vivirla 3.');
(l).vegeta('La vida es muy bonita como para no vivirla 3.');
l.close();
