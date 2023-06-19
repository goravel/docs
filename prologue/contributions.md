# Contribution Guide

[[toc]]

Goravel welcomes rich and diverse contributions from different talents, such as coding, translations, articles, tutorials, etc.

## Bug Reports

You can report a Bug reports [here](https://github.com/goravel/goravel/issues/new?assignees=&labels=%E2%98%A2%EF%B8%8F+Bug%2Cbug&projects=&template=bug_report.yml&title=%F0%9F%90%9B+%5BBug%5D+), please search [Issue List](https://github.com/goravel/goravel/issues?q=is%3Aissue) for similar questions before submitting. The report should contains a title and a clear description of the problem, as much relevant information as possible, and a code sample that demonstrates the problem. The goal of the Bug report is to make it easy for yourself and other persons to reproduce the Bug and develop fixes. Goravel encourages committers to create a PR for the Bug repair at the same time, making the open source project more actively developed.

## Support Questions

Goravel's GitHub issue trackers are not intended to provide Goravel help or support. Instead, use one of the following channels:

- [GitHub Discussions](https://github.com/goravel/goravel/discussions)
- [Telegram](https://github.com/goravel/goravel/tree/master#group)
- [Wechat](https://github.com/goravel/goravel/blob/master/README_zh.md#%E7%BE%A4%E7%BB%84)

## Core Development Discussion

You may propose new features or improvements of existing Goravel behavior in the Goravel framework repository's [GitHub discussion board](https://github.com/goravel/goravel/discussions). Informal discussion regarding bugs, new features, and implementation of existing features takes place in Telegram or Wechat. Bowen, the maintainer of Goravel, is typically present in the group on weekdays from 9am-6pm (UTC+08:00), and sporadically present in the group at other times.

## Contribution

### Find/Create Issue

You can find or create an issue in [Issue List](https://github.com/goravel/goravel/issues), leave a message to express your willingness to deal with the issue, once confirmed by the repository maintainer, the process can be started.

### Create PR

- You can check out [this artisan](https://docs.github.com/en/get-started/quickstart/contributing-to-projects) if you are new to the process;
- During the development process, if you encounter a problem, you can describe the problem in detail in issue at any time for future communication, but before that, please make sure that you have tried to solve the problem through Google and other methods as much as possible;
- Before creating a PR, please improve the unit test coverage as much as possible to provider more stable functions;
- When the PR is developed, please add the `Review Ready `, the maintainer will review in a timely manner.
- After the PR is merged, the issue will be closed automatically if the description in the PR is set correctly;
- Goravel greatly appreciates your contribution and will add you ro the home contribution list at the next release; ❤️

## Which Branch?

**All** bug fixes should be sent to the latest version that supports bug fixes. Bug fixes should **never** be sent to the `master` branch unless they fix features that exist only in the upcoming release.

**Minor** features that are **fully backward compatible** with the current release may be sent to the latest stable branch.

**Major** new features or features with breaking changes should always be sent to the `master` branch, which contains the upcoming release.

## Local Environment

| Software                                                 | Action                                |
| -------------------------------------------------        | --------------                        |
| Golang v1.18                                             | The minimum version                   |
| [vektra/mockery](https://github.com/vektra/mockery)      | Provider mock files for unit tests    |

## Goravel Repository

| Repository                                                             | Action                   |
| -------------------------------------------------------                | --------------         |
| [goravel/goravel](https://github.com/goravel/goravel)                  | Goravel artisans       |
| [goravel/framework](https://github.com/goravel/framework)              | Goravel main repository   |
| [goravel/example](https://github.com/goravel/example)                  | Goravel example            |
| [goravel/example-client](https://github.com/goravel/example-client)    | Example for Grpc client    |
| [goravel/example-proto](https://github.com/goravel/example-proto)      | The proto dependency of example  |
| [goravel/example-package](https://github.com/goravel/example-package)  | Example for package              |
| [goravel/docs](https://github.com/goravel/docs)                        | Document                 |
| [goravel/docs-web](https://github.com/goravel/docs-web)                | Goravel Website                  |
| [goravel/s3](https://github.com/goravel/s3)                            | The S3 driver of Storage module     |
| [goravel/oss](https://github.com/goravel/oss)                          | The OSS driver of Storage module    |
| [goravel/cos](https://github.com/goravel/cos)                          | The COS driver of Storage module    |
| [goravel/minio](https://github.com/goravel/minio)                      | The Minio driver of Storage module  |
| [goravel/redis](https://github.com/goravel/redis)                      | The Redis driver of Cache module    |
| [goravel/file-rotatelogs](https://github.com/goravel/file-rotatelogs)  | Providers log splitting functionality for Log module |
| [goravel/.github](https://github.com/goravel/.github)                  | [Community health file](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file)    |

## Code of Conduct

The Goravel code of conduct is derived from the Laravel code of conduct. Any violations of the code of conduct may be reported to Bowen.

- Participants will be tolerant of opposing views.
- Participants must ensure that their language and actions are free of personal attacks and disparaging personal remarks.
- When interpreting the words and actions of others, participants should always assume good intentions.
- Behavior that can be reasonably considered harassment will not be tolerated.
